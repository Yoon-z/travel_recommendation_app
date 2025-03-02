import './style_app.css';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import Home from './Pages/Home/Home';
import FindAttraction from './Pages/FindAttraction/FindAttraction';
import Log from './Pages/Auth/Login.jsx';
import Register from './Pages/Auth/Register.jsx';
import Event from './Pages/Event/Event.jsx';
import Attraction from './Pages/Attraction/Attraction.jsx';
import UserPref from './Pages/UserPref/UserPref.jsx';
import Profile from './Pages/Profile/Profile.jsx';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/find",
    element: <FindAttraction />,
  },
  {
    path: "/login",
    element: <Log />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/attraction/:id",
    element: <Attraction />,
  },
  {
    path: "/userpref",
    element: <UserPref />,
  },
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/events',
    element: <Event />
  }
]);


function App() {
  return (
    <ThemeProvider theme={theme}>
      <div id='App'>
        <RouterProvider router={router} />
      </div>
    </ThemeProvider>
  );
}
export default App;
