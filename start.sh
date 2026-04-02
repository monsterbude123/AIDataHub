#!/bin/bash
# =============================================================================
# AI DataHub 一键启动脚本
# =============================================================================
# 使用方法:
#   ./start.sh           # 启动所有服务
#   ./start.sh build     # 重新构建镜像并启动
#   ./start.sh stop      # 停止所有服务
#   ./start.sh logs      # 查看日志
#   ./start.sh clean     # 清理所有容器和数据
# =============================================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 项目名称
PROJECT_NAME="AI DataHub"
COMPOSE_FILE="docker-compose.full.yml"

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 打印标题
print_header() {
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  $PROJECT_NAME${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
}

# 检查依赖
check_dependencies() {
    print_info "检查依赖..."

    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装，请先安装 Docker"
        exit 1
    fi

    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装，请先安装 Docker Compose"
        exit 1
    fi

    print_success "依赖检查通过"
}

# 检查环境变量文件
check_env_file() {
    if [ ! -f .env ]; then
        print_warning ".env 文件不存在，从模板创建..."
        cp .env.example .env
        print_info "请编辑 .env 文件配置您的环境变量"
    fi
}

# 构建基础镜像
build_base_image() {
    print_info "构建基础镜像..."
    docker build -f Dockerfile.base -t ai-datahub-base:latest .
    print_success "基础镜像构建完成"
}

# 构建所有服务
build_services() {
    print_info "构建所有服务镜像..."
    docker-compose -f $COMPOSE_FILE build
    print_success "服务镜像构建完成"
}

# 启动服务
start_services() {
    print_info "启动服务..."
    docker-compose -f $COMPOSE_FILE up -d
    print_success "服务启动完成"

    echo ""
    print_info "等待服务健康检查..."
    sleep 10

    # 显示服务状态
    show_status
}

# 停止服务
stop_services() {
    print_info "停止服务..."
    docker-compose -f $COMPOSE_FILE down
    print_success "服务已停止"
}

# 显示日志
show_logs() {
    docker-compose -f $COMPOSE_FILE logs -f
}

# 显示服务状态
show_status() {
    echo ""
    print_info "服务状态:"
    echo ""
    docker-compose -f $COMPOSE_FILE ps
    echo ""

    print_info "健康检查:"
    echo ""

    # 检查各服务健康状态
    services=("api-gateway:3000" "auth-service:4001" "metadata-service:4002" "data-service:4003" "task-scheduler:5001")

    for service in "${services[@]}"; do
        name=$(echo $service | cut -d: -f1)
        port=$(echo $service | cut -d: -f2)

        if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
            echo -e "  ${GREEN}✓${NC} $name (http://localhost:$port)"
        else
            echo -e "  ${RED}✗${NC} $name (http://localhost:$port)"
        fi
    done

    echo ""
    print_info "访问地址:"
    echo ""
    echo "  API Gateway:    http://localhost:3000"
    echo "  Swagger Docs:   http://localhost:3000/api/docs"
    echo "  MinIO Console:  http://localhost:9001"
    echo ""
}

# 清理
clean() {
    print_warning "这将删除所有容器和数据卷！"
    read -p "确定要继续吗？(y/N) " confirm
    if [ "$confirm" = "y" ] || [ "$confirm" = "Y" ]; then
        docker-compose -f $COMPOSE_FILE down -v --remove-orphans
        docker system prune -f
        print_success "清理完成"
    else
        print_info "操作已取消"
    fi
}

# 显示帮助
show_help() {
    print_header
    echo "使用方法:"
    echo "  ./start.sh           启动所有服务"
    echo "  ./start.sh build     重新构建镜像并启动"
    echo "  ./start.sh stop      停止所有服务"
    echo "  ./start.sh restart   重启所有服务"
    echo "  ./start.sh logs      查看日志"
    echo "  ./start.sh status    查看服务状态"
    echo "  ./start.sh clean     清理所有容器和数据"
    echo "  ./start.sh help      显示帮助信息"
    echo ""
}

# 主函数
main() {
    case "${1:-start}" in
        start)
            print_header
            check_dependencies
            check_env_file
            start_services
            ;;
        build)
            print_header
            check_dependencies
            check_env_file
            build_base_image
            build_services
            start_services
            ;;
        stop)
            stop_services
            ;;
        restart)
            stop_services
            sleep 3
            start_services
            ;;
        logs)
            show_logs
            ;;
        status)
            show_status
            ;;
        clean)
            clean
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"