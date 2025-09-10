package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import hibernate.User;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.StandardCopyOption;
import javax.servlet.ServletException;
import javax.servlet.annotation.MultipartConfig;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.Part;
import model.Util;
import org.hibernate.Criteria;
import org.hibernate.Session;
import org.hibernate.criterion.Restrictions;

@MultipartConfig
@WebServlet(name = "UpdateAccount", urlPatterns = {"/UpdateAccount"})
public class UpdateAccount extends HttpServlet {

    private static final String UPLOAD_PATH = "profile_image";

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {

        Gson gson = new Gson();
        JsonObject responseObject = new JsonObject();

        String userIdParam = request.getParameter("id");

        String fullname = request.getParameter("fullName");
        String username = request.getParameter("username");
        String email = request.getParameter("email");
        String password = request.getParameter("password");
        String confirmPassword = request.getParameter("confirmPassword");
        Part filePart = request.getPart("profileImage");

        if (userIdParam == null || userIdParam.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "User ID is required.");
        } else if (fullname == null || fullname.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Full name is required.");
        } else if (username == null || username.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Username is required.");
        } else if (email == null || email.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Email is required.");
        } else if (!Util.isEmailValid(email)) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Please enter a valid email address.");
        } else if (password == null || password.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Password is required.");
        } else if (!Util.isPasswordValid(password)) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character, and be a minimum of eight characters long.");
        } else if (confirmPassword == null || confirmPassword.isEmpty()) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Please confirm your password.");
        } else if (!password.equals(confirmPassword)) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Confirm password did not match your Password.");
        } else if (filePart != null && filePart.getSize() > 0 && !filePart.getContentType().equals("image/jpeg") && !filePart.getContentType().equals("image/jpg")) {
            responseObject.addProperty("status", false);
            responseObject.addProperty("message", "Only JPG images are allowed for the profile picture.");
        } else {
            Session s = hibernate.HibernateUtil.getSessionFactory().openSession();
            try {
                int userId = Integer.parseInt(userIdParam);
                User userToUpdate = (User) s.get(User.class, userId);

                if (userToUpdate == null) {
                    responseObject.addProperty("status", false);
                    responseObject.addProperty("message", "User not found.");
                } else {

                    Criteria userCriteria = s.createCriteria(User.class);
                    userCriteria.add(Restrictions.eq("email", email));
                    User existingUserWithEmail = (User) userCriteria.uniqueResult();

                    if (existingUserWithEmail != null && existingUserWithEmail.getId() != userToUpdate.getId()) {
                        responseObject.addProperty("status", false);
                        responseObject.addProperty("message", "An account with this email already exists.");
                    } else {

                        String profileImageFileName = userToUpdate.getProfile_image();
                        if (filePart != null && filePart.getSize() > 0) {
                            String appPath = getServletContext().getRealPath("");
                            String newPath = appPath.replace("build" + File.separator + "web", "web" + File.separator + UPLOAD_PATH);
                            File uploadDir = new File(newPath);

                            if (!uploadDir.exists()) {
                                uploadDir.mkdir();
                            }

                            File oldImageFile = new File(uploadDir, userToUpdate.getProfile_image());
                            if (oldImageFile.exists()) {
                                oldImageFile.delete();
                            }

                            String fileName = System.currentTimeMillis() + "_profile.jpg";
                            File profile = new File(uploadDir, fileName);
                            Files.copy(filePart.getInputStream(), profile.toPath(), StandardCopyOption.REPLACE_EXISTING);
                            profileImageFileName = fileName;
                        }

                        userToUpdate.setFullname(fullname);
                        userToUpdate.setUsername(username);
                        userToUpdate.setEmail(email);
                        userToUpdate.setPassword(confirmPassword);
                        userToUpdate.setProfile_image(profileImageFileName);

                        s.update(userToUpdate);
                        s.beginTransaction().commit();

                        responseObject.addProperty("status", true);
                        responseObject.addProperty("message", "Successfully updated your account details.");
                    }
                }
            } catch (Exception e) {
                responseObject.addProperty("status", false);
                responseObject.addProperty("message", "An unexpected error occurred. Please try again.");
                System.err.println("Error during account update: " + e.getMessage());
            } finally {
                s.close();
            }
        }

        response.setContentType("application/json");
        response.getWriter().write(gson.toJson(responseObject));
    }
}
