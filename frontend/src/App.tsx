import AppRouter from "./Router/Router";
import { Provider } from "react-redux";
import store from "./redux/store";
import AuthLoader from "./authentication/AuthLoader";

export default function App() {
  return (
    <Provider store={store}>
      <AuthLoader>
        <AppRouter />
      </AuthLoader>
    </Provider>
  );
}
