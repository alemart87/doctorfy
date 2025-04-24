from app import create_app

app = create_app()

def list_routes():
    """Lista todas las rutas registradas en la aplicación"""
    print("Rutas registradas en la aplicación:")
    print("-" * 80)
    
    for rule in app.url_map.iter_rules():
        methods = ','.join(sorted(rule.methods - {'OPTIONS', 'HEAD'}))
        print(f"{rule} ({methods})")
    
    print("-" * 80)

if __name__ == "__main__":
    with app.app_context():
        list_routes() 