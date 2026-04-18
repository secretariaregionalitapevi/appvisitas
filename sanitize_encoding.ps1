
# Rule [AGENTS.md] Sanitize Script
$path = "C:\Users\Usuário\OneDrive\REGIONAL ITAPEVI\SISTEMA REG-IT\INSPINIA\js\controllers_v130.js"
$text = [IO.File]::ReadAllText($path, [Text.Encoding]::UTF8)

# Common triple/double encoding patterns from previous failures
$replacements = @{
    "SANTANA DE PARNAÃƒÆ’Ã‚Â BA" = "SANTANA DE PARNAÍBA";
    "SANTANA DE PARNAÃƒÂ BA"     = "SANTANA DE PARNAÍBA";
    "SANTANA DE PARNAÃ‚Â BA"      = "SANTANA DE PARNAÍBA"
    "MarÃƒÂ§o"                    = "Março";
    "MarÃ§o"                      = "Março";
    "MarÃƒÆ’Ã‚Â§o"                = "Março";
    "usuÃƒÆ’Ã‚Â¡rio"              = "usuário";
    "UsuÃƒÆ’Ã‚Â¡rio"              = "Usuário";
    "UsuÃ¡rio"                    = "Usuário";
    "SecretÃ¡rio"                 = "Secretário";
    "SecretÃƒÂ¡rio"               = "Secretário"
    "MusicalizaÃ§Ã£o"            = "Musicalização";
    "InscriÃ§Ã£o"                 = "Inscrição";
    "RelatÃ³rio"                  = "Relatório";
    "EmissÃ£o"                    = "Emissão";
    "AtuaÃ§Ã£o"                   = "Atuação";
    "FunÃ§Ã£o"                    = "Função";
    "MUNICÃ PIO"                  = "MUNICÍPIO";
    "CONGREGAÃ‡ÃƒO"               = "CONGREGAÇÃO";
    "CRISTÃƒ"                     = "CRISTÃ";
    "MUSICALIZAÃ‡ÃƒO"             = "MUSICALIZAÇÃO";
    "Polo de AtuaÃ§Ã£o"           = "Polo de Atuação";
    "Data invÃ¡lida"              = "Data inválida";
    "Data invÃƒÆ’Ã‚Â¡lida"        = "Data inválida";
    "vocÃª"                       = "você";
    "Nenhum usuÃ¡rio"             = "Nenhum usuário";
    "Nenhum usuÃƒÆ’Ã‚Â¡rio"       = "Nenhum usuário"
}

foreach ($key in $replacements.Keys) {
    if ($text.Contains($key)) {
        $text = $text.Replace($key, $replacements[$key])
    }
}

# Ensure Syntax logic remains clean
# Fix the specific "parts.push(digits.slice(2, 4))    $scope.exportToPDF = function ()" if it still exists
if ($text.Contains("parts.push(digits.slice(2, 4))    `$scope.exportToPDF")) {
    $text = $text.Replace("parts.push(digits.slice(2, 4))    `$scope.exportToPDF", "parts.push(digits.slice(2, 4));`n        } else if (digits.length > 2) {`n            parts.push(digits.slice(2));`n        }`n`n        if (digits.length > 4) {`n            parts.push(digits.slice(4));`n        }`n`n        return parts.join('/');`n    };`n`n    `$scope.exportToPDF")
}

# Force accurate UTF-8 Write without BOM as per RULE[AGENTS.md]
[IO.File]::WriteAllText($path, $text, (New-Object Text.UTF8Encoding($false)))
