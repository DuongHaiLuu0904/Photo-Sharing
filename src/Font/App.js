
import { Grid, Paper } from "@mui/material";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";

import TopBar from "./components/TopBar";
import UserDetail from "./components/UserDetail";
import UserList from "./components/UserList";
import UserPhotos from "./components/UserPhotos";
import UserComments from "./components/UserComments";
import LoginRegister from "./components/LoginRegister";
import UploadPhoto from "./components/UploadPhoto";
import ProtectedRoute from "./components/ProtectedRoute";
import { AppProvider } from "./contexts/AppContext";
import EditUser from "./components/EditUser";

const App = (props) => {
    return (
        <AppProvider>
            <Router>
                <div>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TopBar />
                        </Grid>
                        <div className="main-topbar-buffer" />
                        <Grid item sm={3}>
                            <Paper className="main-grid-item">
                                <ProtectedRoute hideOnLogin={true}>
                                    <UserList />
                                </ProtectedRoute>
                            </Paper>
                        </Grid>
                        <Grid item sm={9}>
                            <Paper className="main-grid-item">
                                <Routes>
                                    <Route path="/login" element={<LoginRegister />} />
                                    <Route path="/" element={<Navigate to="/users" replace />} />
                                    <Route
                                        path="/users/:userId"
                                        element={
                                            <ProtectedRoute>
                                                <UserDetail />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/photos/:userId"
                                        element={
                                            <ProtectedRoute>
                                                <UserPhotos />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/photos/:userId/:photoId"
                                        element={
                                            <ProtectedRoute>
                                                <UserPhotos />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/comments/:userId"
                                        element={
                                            <ProtectedRoute>
                                                <UserComments />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/upload-photo"
                                        element={
                                            <ProtectedRoute>
                                                <UploadPhoto />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/users"
                                        element={
                                            <ProtectedRoute>
                                                <UserList />
                                            </ProtectedRoute>
                                        }
                                    />
                                    <Route
                                        path="/user/edit/:userId"
                                        element={
                                            <ProtectedRoute>
                                                <EditUser />
                                            </ProtectedRoute>
                                        }
                                    />
                                    
                                </Routes>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
            </Router>
        </AppProvider>
    );
}

export default App;
