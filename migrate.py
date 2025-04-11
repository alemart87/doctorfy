import os
import sys
import importlib
import glob

def run_migrations():
    print("Ejecutando migraciones...")
    
    # Obtener todos los archivos de migración
    migration_files = glob.glob('migrations/*.py')
    
    # Filtrar archivos que no son migraciones
    migration_files = [f for f in migration_files if not f.endswith('__init__.py')]
    
    # Ordenar los archivos para ejecutarlos en orden
    migration_files.sort()
    
    # Ejecutar cada migración
    for migration_file in migration_files:
        # Convertir la ruta del archivo a un módulo importable
        module_name = migration_file.replace('/', '.').replace('\\', '.').replace('.py', '')
        print(f"Ejecutando migración: {module_name}")
        
        try:
            # Importar el módulo de migración
            migration_module = importlib.import_module(module_name)
            
            # Ejecutar la migración
            migration_module.run_migration()
            
        except Exception as e:
            print(f"Error al ejecutar la migración {module_name}: {str(e)}")
            import traceback
            traceback.print_exc()
            sys.exit(1)
    
    print("Todas las migraciones se ejecutaron con éxito.")

if __name__ == "__main__":
    # Asegurarse de que el directorio de migraciones existe
    os.makedirs('migrations', exist_ok=True)
    
    # Crear un archivo __init__.py en el directorio de migraciones si no existe
    init_file = os.path.join('migrations', '__init__.py')
    if not os.path.exists(init_file):
        with open(init_file, 'w') as f:
            f.write('# Este archivo permite que el directorio sea un paquete Python\n')
    
    # Ejecutar las migraciones
    run_migrations() 