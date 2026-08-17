
# Store Rating Application

A full-stack web application that allows users to view registered stores and submit ratings ranging from **1 to 5**. The application implements a role-based authentication system with different functionalities for **System Administrators, Normal Users, and Store Owners**.

🚀 Tech Stack
### Frontend

* React.js
* JavaScript
* HTML
* CSS

Backend
* Node.js
* Express.js
* REST APIs

Database
* MySQL

👥 User Roles
The application supports three different user roles:

1. System Administrator

The System Administrator can:

* Add new stores.
* Add normal users and administrator users.
* View dashboard statistics:

  * Total number of users
  * Total number of stores
  * Total number of submitted ratings
* View and manage stores.
* View normal and administrator users.
* View detailed information about users.
* Apply filters based on Name, Email, Address, and Role.
* Sort table data in ascending or descending order.
* View the rating associated with a Store Owner.
* Log out from the system.

2. Normal User

A Normal User can:

* Register and log in to the platform.
* Update their password.
* View all registered stores.
* Search stores by Name and Address.
* View:

  * Store Name
  * Store Address
  * Overall Rating
  * Their submitted rating
* Submit a rating between **1 and 5** for a store.
* Modify their previously submitted rating.
* Log out from the system.

3. Store Owner

A Store Owner can:

* Log in to the platform.
* Update their password.
* View users who have submitted ratings for their store.
* View the average rating of their store.
* Log out from the system.

⭐ Rating System

* Users can submit ratings from **1 to 5**.
* A user can submit one rating for a store.
* Users can update or modify their submitted rating.
* The overall store rating is calculated based on submitted user ratings.
* Store Owners can view the average rating of their store.

🔐 Authentication and Authorization

The application uses a single login system for all users.

After authentication, users are provided access to features based on their assigned role:

* `ADMIN`
* `USER`
* `STORE_OWNER`

Role-based authorization is implemented to ensure that users can access only the functionalities assigned to their role.

✅ Form Validations

The application includes the following validations:

| Field    | Validation                                                                         |
| -------- | ---------------------------------------------------------------------------------- |
| Name     | Minimum 20 characters and maximum 60 characters                                    |
| Email    | Must follow standard email format                                                  |
| Address  | Maximum 400 characters                                                             |
| Password | 8–16 characters, including at least one uppercase letter and one special character |
| Rating   | Value must be between 1 and 5                                                      |

📊 Features

* User Registration and Login
* Role-Based Access Control
* Store Management
* User Management
* Rating Submission and Update
* Store Search
* Filtering
* Sorting
* Dashboard Statistics
* Password Update
* Average Store Rating Calculation
* Responsive User Interface


👩‍💻 Author

**Sayali Mali**

## 📌 Project Type

Full Stack Intern Coding Challenge

Built using **React.js, Node.js, Express.js, and MySQL**.
