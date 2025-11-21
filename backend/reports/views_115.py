from django.shortcuts import render
from decimal import Decimal
from rest_framework import status
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.http import HttpResponse, FileResponse
from rest_framework.views import APIView
import io
from datetime import datetime
import logging
from rest_framework.permissions import IsAuthenticated
from django.template.loader import render_to_string
from weasyprint import HTML
from django.conf import settings
import os
from django.core.files.base import ContentFile

# PyPDF2 for merging PDFs
from PyPDF2 import PdfWriter, PdfReader

# Import from your survey app
from survey.models import Survey
from accounts.premissions import HasModuleAccess

logger = logging.getLogger(__name__)


# ==================== HELPER FUNCTION ====================
def generate_and_save_pdf(survey, request=None):
    try:
        if survey.pdfreport and os.path.isfile(survey.pdfreport.path):
            os.remove(survey.pdfreport.path)
            survey.pdfreport = None

        single_report_generator = SingleReport115GenerateView()

        if request is None:
            from django.test import RequestFactory
            request = RequestFactory().get("/")
            request.build_absolute_uri = lambda uri="": f"https://dehu.lohamuncipal.in/{uri}"

        pdf_content = single_report_generator.generate_single_report(
            survey, "pdf", request
        )

        pdf_filename = f"Survey_Report_Ward_{survey.ward_no}_Property_{survey.property_no}_{survey.id}.pdf"

        # REMOVE save=False
        survey.pdfreport.save(pdf_filename, ContentFile(pdf_content))
        survey.save()  # <<< REQUIRED

        return True, "PDF generated successfully"

    except Exception as e:
        return False, str(e)



# ==================== SINGLE REPORT 115 VIEW ====================
@method_decorator(csrf_exempt, name="dispatch")
class SingleReport115GenerateView(APIView):
    """Generate single 115 report"""
    
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "generate-report-115"

    def get(self, request, survey_id):
        try:
            survey = Survey.objects.get(pk=survey_id)

            report_content = self.generate_single_report(survey, "pdf", request)
            response = HttpResponse(report_content, content_type="application/pdf")
            filename = f"Report_115_Single_Ward_{survey.ward_no}_Property_{survey.property_no}.pdf"
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response
            
        except Survey.DoesNotExist:
            return Response(
                {"success": False, "message": "Survey not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error generating single report: {str(e)}", exc_info=True)
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def generate_single_report(self, survey, format_type, request):
        """Generate single report - PDF or HTML"""
        context = self.prepare_report_context(survey, request)
        html_content = render_to_string("report_115_template.html", context)

        if format_type == "pdf":
            pdf_buffer = io.BytesIO()
            HTML(
                string=html_content, base_url=request.build_absolute_uri("/")
            ).write_pdf(pdf_buffer)
            pdf_buffer.seek(0)
            return pdf_buffer.getvalue()
        else:
            return html_content.encode("utf-8")

    def prepare_report_context(self, survey, request):
        """Prepare context data for report"""
        floors = []

        try:
            # Floor data
            if hasattr(survey, "floor_data"):
                floors = list(survey.floor_data.all().order_by("floor_number"))
                
        except Exception as e:
            logger.error(f"Error preparing floor data for survey {survey.id}: {e}", exc_info=True)

        # Property image
        property_image_url = None
        if hasattr(survey, "connection_photo") and survey.connection_photo:
            try:
                if hasattr(survey.connection_photo, "url"):
                    property_image_url = request.build_absolute_uri(survey.connection_photo.url)
                else:
                    property_image_url = request.build_absolute_uri(
                        settings.MEDIA_URL + str(survey.connection_photo)
                    )
            except Exception as e:
                logger.warning(f"Error building property image URL: {e}")

        return {
            "entry": survey,
            "floors": floors,
            "ulb": {"system_name": "देहू नगरपरिषद"},
            "notice_date": datetime.now().strftime("%d/%m/%Y"),
            "current_date": datetime.now().strftime("%d/%m/%Y"),
            "logo_url": request.build_absolute_uri(settings.MEDIA_URL + "images/dehulogo.png"),
            "signature_url": request.build_absolute_uri(settings.MEDIA_URL + "images/signature.png"),
            "regular_font_url": request.build_absolute_uri(settings.STATIC_URL + "fonts/NotoSansDevanagari-Regular.ttf"),
            "bold_font_url": request.build_absolute_uri(settings.STATIC_URL + "fonts/NotoSansDevanagari-Bold.ttf"),
            "property_image_url": property_image_url,
            "has_floors": len(floors) > 0,
        }


# ==================== BULK PDF DOWNLOAD - SINGLE MERGED PDF ====================
@method_decorator(csrf_exempt, name="dispatch")
class BulkReport115GenerateView(APIView):
    """
    Merge all reports into single PDF and download
    """
    
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "generate-report-115"

    def post(self, request):
        try:
            ward_no = request.data.get("ward_no")
            property_no_start = request.data.get("property_no_start")
            property_no_end = request.data.get("property_no_end")

            # Validation
            if not ward_no:
                return Response(
                    {"success": False, "message": "Ward number आवश्यक आहे"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            try:
                ward_number = int(ward_no)
            except (ValueError, TypeError):
                return Response(
                    {"success": False, "message": "कृपया योग्य ward number टाका"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Query building
            surveys_query = Survey.objects.filter(ward_no=ward_number)

            # Property range optional
            if property_no_start and property_no_end:
                surveys_query = surveys_query.filter(
                    property_no__gte=property_no_start,
                    property_no__lte=property_no_end,
                )

            surveys = surveys_query.order_by("property_no")

            if not surveys.exists():
                if property_no_start and property_no_end:
                    message = f"Ward {ward_number}, Property {property_no_start}-{property_no_end} data उपलब्ध नाही"
                else:
                    message = f"Ward {ward_number} साठी data उपलब्ध नाही"
                return Response(
                    {"success": False, "message": message},
                    status=status.HTTP_404_NOT_FOUND,
                )

            # Generate/ensure PDFs exist and merge them
            merged_pdf = self.merge_existing_pdfs(surveys, request)

            # Create filename
            if property_no_start and property_no_end:
                filename = f"Survey_Reports_Ward_{ward_number}_Property_{property_no_start}_to_{property_no_end}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
            else:
                filename = f"Survey_Reports_Ward_{ward_number}_All_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"

            # Return merged PDF
            response = HttpResponse(merged_pdf, content_type="application/pdf")
            response["Content-Disposition"] = f'attachment; filename="{filename}"'
            return response

        except Exception as e:
            logger.error(f"Combined PDF download error: {str(e)}", exc_info=True)
            return Response(
                {"success": False, "message": f"Download error: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def merge_existing_pdfs(self, surveys, request):
        """
        Merge existing single PDFs into one combined PDF using PyPDF2
        """
        try:
            pdf_writer = PdfWriter()
            missing_pdfs = []
            generated_pdfs = []

            for survey in surveys:
                try:
                    # Check if PDF exists and is valid
                    if not survey.pdfreport or not os.path.isfile(survey.pdfreport.path):
                        # Generate PDF if not exists
                        pdf_success, pdf_message = generate_and_save_pdf(survey, request)
                        if pdf_success:
                            survey.save()
                            generated_pdfs.append(survey.id)
                            logger.info(f"Generated missing PDF for survey {survey.id}")
                        else:
                            missing_pdfs.append(f"Survey {survey.id}: {pdf_message}")
                            logger.error(f"Failed to generate PDF for survey {survey.id}: {pdf_message}")
                            continue

                    # Merge existing PDF
                    with open(survey.pdfreport.path, "rb") as pdf_file:
                        pdf_reader = PdfReader(pdf_file, strict=False)
                        for page in pdf_reader.pages:
                            pdf_writer.add_page(page)

                        
                        logger.info(f"Added {len(pdf_reader.pages)} pages from survey {survey.id}")

                except Exception as e:
                    logger.error(f"Error processing PDF for survey {survey.id}: {str(e)}")
                    missing_pdfs.append(f"Survey {survey.id}: Processing error - {str(e)}")

            # Write merged PDF to buffer
            output_buffer = io.BytesIO()
            pdf_writer.write(output_buffer)
            pdf_writer.close()
            output_buffer.seek(0)
            merged_content = output_buffer.getvalue()
            output_buffer.close()

            # Log summary
            total_surveys = surveys.count()
            successful_merges = total_surveys - len(missing_pdfs)
            logger.info(f"PDF merge completed: {successful_merges}/{total_surveys} PDFs merged successfully")
            
            if generated_pdfs:
                logger.info(f"Generated {len(generated_pdfs)} missing PDFs: {generated_pdfs}")
            
            if missing_pdfs:
                logger.warning(f"Failed to process {len(missing_pdfs)} PDFs: {missing_pdfs[:5]}")

            return merged_content

        except ImportError:
            logger.error("PyPDF2 not installed. Install with: pip install PyPDF2")
            raise Exception("PyPDF2 library not installed")
        except Exception as e:
            logger.error(f"PDF merge error: {str(e)}")
            raise e


# ==================== SINGLE PDF DOWNLOAD VIEW ====================
@method_decorator(csrf_exempt, name="dispatch")
class SinglePDFDownloadView(APIView):
    """Download saved PDF from database"""
    
    permission_classes = [IsAuthenticated, HasModuleAccess]
    required_permission = "download-survey-pdf"

    def get(self, request, survey_id):
        try:
            survey = Survey.objects.get(id=survey_id)

            # Generate PDF if not exists
            if not survey.pdfreport or not os.path.isfile(survey.pdfreport.path):
                pdf_success, pdf_message = generate_and_save_pdf(survey, request)
                if not pdf_success:
                    return Response(
                        {"success": False, "message": f"PDF generation failed: {pdf_message}"},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
                survey.save()

            # Download PDF
            response = FileResponse(
                open(survey.pdfreport.path, "rb"), content_type="application/pdf"
            )
            filename = f"Survey_Ward_{survey.ward_no}_Property_{survey.property_no}.pdf"
            response["Content-Disposition"] = f'attachment; filename="{filename}"'

            return response

        except Survey.DoesNotExist:
            return Response(
                {"success": False, "message": "Survey not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"PDF download error: {str(e)}", exc_info=True)
            return Response(
                {"success": False, "message": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )