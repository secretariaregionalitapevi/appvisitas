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

def resetar_senha(email, nova_senha):
    try:
        # Primeiro, buscar o ID do usuário pelo email
        # O admin.list_users() pode ser usado para encontrar o usuário
        users_res = supabase.auth.admin.list_users()
        user = next((u for u in users_res if u.email == email), None)
        
        if not user:
            print(f"Erro: Usuário {email} não encontrado.")
            return

        # Resetar a senha
        res = supabase.auth.admin.update_user_by_id(
            user.id,
            attributes={"password": nova_senha}
        )
        print(f"Sucesso! Senha do usuário {email} (ID: {user.id}) foi resetada.")
        
    except Exception as e:
        print(f"Erro ao resetar senha: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Uso: python scripts/resetar_senha.py <email> <nova_senha>")
        sys.exit(1)
        
    resetar_senha(sys.argv[1], sys.argv[2])
