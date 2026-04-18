import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

def confirm_all():
    print("Buscando usuários para confirmação manual...")
    users = supabase.auth.admin.list_users()
    
    count = 0
    for user in users:
        # Verifica se o email NÃO está confirmado
        if not user.email_confirmed_at:
            print(f"Confirmando: {user.email}")
            try:
                supabase.auth.admin.update_user_by_id(
                    user.id,
                    attributes={"email_confirm": True}
                )
                count += 1
            except Exception as e:
                print(f"Erro ao confirmar {user.email}: {e}")
    
    print(f"Finalizado. {count} usuários confirmados manualmente.")

if __name__ == "__main__":
    confirm_all()
