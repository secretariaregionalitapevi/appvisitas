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

def listar_usuarios():
    try:
        # Tentar listar usuários usando a API de Admin
        users = supabase.auth.admin.list_users()
        print(f"{'Email':<40} | {'UUID':<40} | {'Confirmed'}")
        print("-" * 100)
        for user in users:
            confirmed = "Sim" if user.email_confirmed_at else "Não"
            print(f"{str(user.email):<40} | {str(user.id):<40} | {confirmed}")
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")

if __name__ == "__main__":
    listar_usuarios()
