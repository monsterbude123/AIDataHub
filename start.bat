@echo off
REM =============================================================================
REM AI DataHub 一键启动脚本 (Windows)
REM =============================================================================
REM 使用方法:
REM   start.bat           启动所有服务
REM   start.bat build     重新构建镜像并启动
REM   start.bat stop      停止所有服务
REM   start.bat logs      查看日志
REM   start.bat status    查看服务状态
REM   start.bat clean     清理所有容器和数据
REM =============================================================================

setlocal enabledelayedexpansion
set COMPOSE_FILE=docker-compose.full.yml

REM 颜色代码（Windows 10+）
set "GREEN=[92m"
set "RED=[91m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "NC=[0m"

:main
if "%1"=="" goto start
if "%1"=="start" goto start
if "%1"=="build" goto build
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="clean" goto clean
if "%1"=="help" goto help
goto help

:start
call :print_header
call :check_dependencies
call :check_env_file
echo.
echo %BLUE%[INFO]%NC% 启动服务...
docker-compose -f %COMPOSE_FILE% up -d
echo %GREEN%[SUCCESS]%NC% 服务启动完成
call :show_status
goto end

:build
call :print_header
call :check_dependencies
call :check_env_file
echo.
echo %BLUE%[INFO]%NC% 构建基础镜像...
docker build -f Dockerfile.base -t ai-datahub-base:latest .
echo %GREEN%[SUCCESS]%NC% 基础镜像构建完成
echo.
echo %BLUE%[INFO]%NC% 构建服务镜像...
docker-compose -f %COMPOSE_FILE% build
echo %GREEN%[SUCCESS]%NC% 服务镜像构建完成
call :show_status
goto end

:stop
echo %BLUE%[INFO]%NC% 停止服务...
docker-compose -f %COMPOSE_FILE% down
echo %GREEN%[SUCCESS]%NC% 服务已停止
goto end

:restart
call :stop
timeout /t 3 /nobreak > nul
call :start
goto end

:logs
docker-compose -f %COMPOSE_FILE% logs -f
goto end

:status
call :show_status
goto end

:clean
echo %RED%[WARNING]%NC% 这将删除所有容器和数据卷！
set /p confirm="确定要继续吗？(y/N) "
if /i "%confirm%"=="y" (
    docker-compose -f %COMPOSE_FILE% down -v --remove-orphans
    docker system prune -f
    echo %GREEN%[SUCCESS]%NC% 清理完成
) else (
    echo %BLUE%[INFO]%NC% 操作已取消
)
goto end

:help
call :print_header
echo 使用方法:
echo   start.bat           启动所有服务
echo   start.bat build     重新构建镜像并启动
echo   start.bat stop      停止所有服务
echo   start.bat restart   重启所有服务
echo   start.bat logs      查看日志
echo   start.bat status    查看服务状态
echo   start.bat clean     清理所有容器和数据
echo   start.bat help      显示帮助信息
echo.
goto end

:print_header
echo.
echo %GREEN%========================================%NC%
echo %GREEN%  AI DataHub%NC%
echo %GREEN%========================================%NC%
echo.
goto :eof

:check_dependencies
echo %BLUE%[INFO]%NC% 检查依赖...
where docker >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker 未安装，请先安装 Docker Desktop
    exit /b 1
)
where docker-compose >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker Compose 未安装
    exit /b 1
)
echo %GREEN%[SUCCESS]%NC% 依赖检查通过
goto :eof

:check_env_file
if not exist .env (
    echo %YELLOW%[WARNING]%NC% .env 文件不存在，从模板创建...
    copy .env.example .env >nul
    echo %BLUE%[INFO]%NC% 请编辑 .env 文件配置您的环境变量
)
goto :eof

:show_status
echo.
echo %BLUE%[INFO]%NC% 服务状态:
echo.
docker-compose -f %COMPOSE_FILE% ps
echo.
echo %BLUE%[INFO]%NC% 访问地址:
echo.
echo   API Gateway:    http://localhost:3000
echo   Swagger Docs:   http://localhost:3000/api/docs
echo   MinIO Console:  http://localhost:9001
echo.
goto :eof

:end
endlocal