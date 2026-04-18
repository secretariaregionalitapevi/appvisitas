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

def testar_login(email, password):
    try:
        # Tentar fazer login (não usa service role key para login normal, usa a anon key)
        # Mas para teste, o client inicializado com service role também funciona
        res = supabase.auth.sign_in_with_password({"email": email, "password": password})
        if res.user:
            print(f"Sucesso! Login realizado para {email}")
            print(f"User ID: {res.user.id}")
            print(f"Confirmado em: {res.user.email_confirmed_at}")
        else:
            print(f"Falha: Resposta sem usuário para {email}")
    except Exception as e:
        print(f"Erro no login: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python scripts/testar_login.py <EMAIL> <PASSWORD>")
        sys.exit(1)
    
    email = sys.argv[1]
    password = sys.argv[2]
    testar_login(email, password)
