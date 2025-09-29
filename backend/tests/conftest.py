import sys, os
# Agrega la carpeta backend al sys.path para que 'lambdas' sea importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))