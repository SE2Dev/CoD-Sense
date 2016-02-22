@echo off
node build/build.js --srcDir ./raw --outDir ../
if NOT %ERRORLEVEL% EQU 0 (
   echo Failed with Error Code: %errorlevel%
   pause
   exit /b %errorlevel%
)