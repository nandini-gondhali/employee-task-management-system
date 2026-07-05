# Architecture / Flow Diagram

## Basic Flow

```mermaid
flowchart TD
    A[User] --> B[Angular Frontend]
    B --> C[Node.js / Express Backend]
    C --> D[MySQL Database]
    C --> E[Uploads Folder]
```

## Application Flow

```mermaid
flowchart TD
    A[Login / Register] --> B[JWT Token Generated]
    B --> C[Token Stored in Browser]

    C --> D{User Role}

    D -->|Admin| E[Admin Dashboard]
    D -->|Employee| F[Employee Dashboard]

    E --> G[Manage Employees]
    E --> H[Create / Update / Delete Tasks]
    E --> I[View Reports]

    F --> J[View Assigned Tasks]
    F --> K[Update Task Status]

    H --> L[Notifications Created]
    K --> L

    G --> M[(MySQL Database)]
    H --> M
    I --> M
    L --> M
```

## Role Flow

```mermaid
flowchart LR
    A[Admin] --> B[Dashboard]
    A --> C[Employee Management]
    A --> D[Task Management]
    A --> E[Reports]

    F[Employee] --> G[Dashboard]
    F --> H[My Tasks]
    F --> I[Notifications]
```

## Database Tables

```mermaid
erDiagram
    USERS ||--o| EMPLOYEES : linked_to
    EMPLOYEES ||--o{ TASKS : assigned_tasks
    USERS ||--o{ NOTIFICATIONS : receives
    TASKS ||--o{ TASK_ATTACHMENTS : has_files

    USERS {
        int id
        string full_name
        string email
        string password_hash
        string role
    }

    EMPLOYEES {
        int id
        int user_id
        string name
        string email
        string department
        string designation
    }

    TASKS {
        int id
        string title
        string description
        string priority
        string status
        date start_date
        date due_date
        int assigned_employee_id
    }

    NOTIFICATIONS {
        int id
        int user_id
        int task_id
        string message
        string type
        boolean is_read
    }

    TASK_ATTACHMENTS {
        int id
        int task_id
        string file_path
        string original_name
    }
```

## Short Explanation

The Angular frontend sends requests to the Express backend using REST APIs.  
The backend checks JWT authentication and user role before allowing access.  
Admin users can manage employees, tasks, and reports.  
Employee users can view their own dashboard and assigned tasks only.  
All data is stored in MySQL. Uploaded files are stored in the backend uploads folder, and their file paths are saved in the database.