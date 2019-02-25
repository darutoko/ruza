@del C:\Users\Alex\Web\ruza\public /s /q
@xcopy C:\Users\Alex\github\ruza\web\dist\* C:\Users\Alex\Web\ruza\public\ /v /f /s /y
@xcopy C:\Users\Alex\github\ruza\core\db\* C:\Users\Alex\Web\ruza\db\ /v /f /s /y
@xcopy C:\Users\Alex\github\ruza\core\graphql\* C:\Users\Alex\Web\ruza\graphql\ /v /f /s /y
@xcopy C:\Users\Alex\github\ruza\core\middleware\* C:\Users\Alex\Web\ruza\middleware\ /v /f /s /y
@xcopy C:\Users\Alex\github\ruza\core\app.js C:\Users\Alex\Web\ruza\ /v /f /y
@xcopy C:\Users\Alex\github\ruza\core\config.js C:\Users\Alex\Web\ruza\ /v /f /y
@xcopy C:\Users\Alex\github\ruza\core\package.json C:\Users\Alex\Web\ruza\ /v /f /y
@xcopy C:\Users\Alex\github\ruza\core\package-lock.json C:\Users\Alex\Web\ruza\ /v /f /y
@xcopy C:\Users\Alex\github\ruza\start.bat C:\Users\Alex\Web\ruza\ /v /f /y
@xcopy C:\Users\Alex\github\ruza\start.vbs C:\Users\Alex\Web\ruza\ /v /f /y
@pause