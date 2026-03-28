 It provides clear, step‑by‑step instructions for installing DDEV on Windows and running your Drupal project locally with the provided `db.sql` file.

```markdown
# Drupal Project – Local Setup with DDEV (Windows)

Follow these steps to install DDEV on Windows and run this project locally.

---

## 1. Install Prerequisites

Before installing DDEV, make sure you have the following installed:

- **Windows 10/11 Pro or Enterprise** (required for Docker Desktop)
- **Docker Desktop for Windows**  
  Download and install from: https://www.docker.com/products/docker-desktop  
  > ⚠️ Ensure that **WSL2** and **Linux containers** are enabled during installation.
- **Git for Windows**  
  Download from: https://git-scm.com/download/win
- **DDEV**  
  Download the latest Windows installer from: https://ddev.readthedocs.io/en/stable/users/install/ddev-installation/

After installation, verify DDEV is working by running:

```powershell
ddev version
```

---

## 2. Clone the Repository

Open **PowerShell** or **Git Bash** and clone your project:

```powershell
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

---

## 3. Configure DDEV for Drupal

Inside the project folder, run:

```powershell
ddev config --project-type=drupal --docroot=web --create-docroot
```

- Replace `web` with your Drupal docroot folder if different (e.g., `htdocs` or `drupal`).
- This creates a `.ddev` folder with configuration files.

---

## 4. Start the DDEV Environment

```powershell
ddev start
```

This will spin up the containers (web, db, etc.).

---

## 5. Import the Database

Assuming you have a `db.sql` file in the repository root:

```powershell
ddev import-db --src=db.sql
```


#This works regardless of filename:

```powershell
gzip -dc db.sql | ddev import-db
```


---

## 6. Install Project Dependencies

If your project uses **Composer**:

```powershell
ddev composer install
```

---

## 7. Access the Site

Once everything is running:

- Website: http://<projectname>.ddev.site  
- phpMyAdmin: http://<projectname>.ddev.site:8036  
- Mailhog (email testing): http://<projectname>.ddev.site:8025  

---

## 8. Common Commands

- Stop containers:  
  ```powershell
  ddev stop
  ```

- Restart containers:  
  ```powershell
  ddev restart
  ```

- SSH into web container:  
  ```powershell
  ddev ssh
  ```

---

## ✅ You’re Ready!

Your Drupal project should now be running locally with DDEV on Windows.
```

---