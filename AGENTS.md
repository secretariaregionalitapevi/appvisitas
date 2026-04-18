# AGENTS.md

## Regras Obrigatórias de Encoding

1. Todo arquivo de texto deve permanecer em **UTF-8**.
2. Nunca salvar HTML/CSS/JS/JSON/ENV com ANSI/Windows-1252/UTF-16.
3. Em PowerShell, evitar `Set-Content` sem controle de encoding.
4. Preferir gravação via `.NET` com UTF-8 explícito sem BOM:
   - `[IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding($false)))`
5. Após qualquer edição em arquivos de UI (`*.html`, `*.js`, `*.css`), validar:
   - ausência de mojibake (`Ã`, `Â`, `�`)
   - leitura UTF-8 válida por decodificação estrita.

## Regra de Trabalho

Antes de concluir qualquer alteração, executar validação de encoding nos arquivos alterados e corrigir imediatamente se houver qualquer indício de corrupção.
