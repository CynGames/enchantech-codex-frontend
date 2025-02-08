@echo off
setlocal enabledelayedexpansion

:: Check if argument is provided
if "%~1"=="" (
    call :show_usage
    exit /b 1
)

:: Main logic
if "%~1"=="frontend-deploy" (
    call :deploy_frontend
) else if "%~1"=="frontend-connect" (
    call :connect_frontend
) else (
    call :show_usage
    exit /b 1
)
exit /b 0

:show_usage
echo Usage: .\deploy.bat [command]
echo Commands:
echo   deploy-frontend      Deploy frontend application using WSL
echo   connect-frontend     Connect to frontend server
exit /b 0

:deploy_frontend
echo Deploying frontend...
:: Build Angular app and wait for completion
call ng build
if %ERRORLEVEL% neq 0 (
    echo Angular build failed
    exit /b 1
)

:: Deploy to EC2 using WSL
wsl rsync -avz --include 'dist/' --include 'dist/**' --exclude '*' -e "ssh -i /home/tomas/tomas-pc.pem" . ubuntu@ec2-34-207-39-54.compute-1.amazonaws.com:~/app
if %ERRORLEVEL% neq 0 (
    echo Rsync failed
    exit /b 1
)

:: Copy files and reload nginx
ssh -i C:\Users\Tomas\.ssh\tomas-pc.pem ubuntu@ec2-34-207-39-54.compute-1.amazonaws.com "sudo cp -r /home/ubuntu/app/dist/enchantech-codex-frontend/browser/* /var/www/html/"
ssh -i C:\Users\Tomas\.ssh\tomas-pc.pem ubuntu@ec2-34-207-39-54.compute-1.amazonaws.com "sudo systemctl reload nginx"

echo Deployment completed successfully
exit /b 0

:connect
ssh -i C:\Users\Tomas\.ssh\tomas-pc.pem ubuntu@ec2-34-207-39-54.compute-1.amazonaws.com
exit /b 0
