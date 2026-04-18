import os
import sys
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_ROLE_KEY:
    print("Erro: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados no .env")
    sys.exit(1)

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def listar_tabelas():
    try:
        # Consulta para listar tabelas no schema public
        query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        """
        # Usando rpc ou query direta se possível, mas o client-py
        # não tem um método direto para raw SQL facilmente sem rpc.
        # Vou tentar um rpc genérico se houver ou uma consulta numa tabela conhecida
        
        # Como alternativa, vou tentar dar um select em tabelas conhecidas do .env
        tabelas = [
            os.getenv("SUPABASE_TABLE_CADASTROS"),
            os.getenv("SUPABASE_TABLE_CRIANCA"),
            os.getenv("SUPABASE_TABLE_AUXILIARES"),
            os.getenv("SUPABASE_TABLE_RECITATIVOS")
        ]
        
        print(f"{'Tabela':<30} | {'Status'}")
        print("-" * 40)
        for t in tabelas:
            if not t: continue
            try:
                res = supabase.table(t).select("*", count="exact").limit(1).execute()
                print(f"{t:<30} | OK")
            except Exception as e:
                print(f"{t:<30} | Erro: {e}")
                
    except Exception as e:
        print(f"Erro ao listar tabelas: {e}")

if __name__ == "__main__":
    listar_tabelas()
