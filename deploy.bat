@echo off
set GCLOUD="C:\Users\mihip\AppData\Local\Google\Cloud SDK\google-cloud-sdk\bin\gcloud.cmd"

echo Setting GCP account to smarttransnet@outlook.com...
call %GCLOUD% config set account smarttransnet@outlook.com
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo Setting GCP project to note365...
call %GCLOUD% config set project note365
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo Building Client-FE production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo Syncing production build to Google Cloud Storage bucket gs://practice121-fe-client/...
call %GCLOUD% storage rsync -r dist gs://practice121-fe-client/
if %ERRORLEVEL% NEQ 0 exit /b %ERRORLEVEL%

echo =======================================================
echo Deployment of Client-FE to Google Cloud Completed Successfully!
echo =======================================================
