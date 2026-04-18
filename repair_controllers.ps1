
$relativePath = "..\..\REGIONAL ITAPEVI\SISTEMA REG-IT\INSPINIA\js\controllers_v130.js"
$content = [System.IO.File]::ReadAllText($relativePath, [System.Text.Encoding]::UTF8)

# 1. Fix the messed up formatDateInput and duplicated exportToPDF at the end
$badBlock = 'parts.push(digits.slice(2, 4))    $scope.exportToPDF = function () {'
$goodBlock = "parts.push(digits.slice(2, 4));`r`n        } else if (digits.length > 2) {`r`n            parts.push(digits.slice(2));`r`n        }`r`n`r`n        if (digits.length > 4) {`r`n            parts.push(digits.slice(4));`r`n        }`r`n`r`n        return parts.join('/');`r`n    };`r`n`r`n    function isValidFullDate(value) {`r`n        return /^\d{2}\/\d{2}\/\d{4}$/.test(String(value || '').trim());`r`n    }`r`n`r`n`r`n    function updateDeletePermission() {`r`n        var currentUser = `$rootScope.currentUser || {};`r`n        var role = (currentUser.role || '').toString().toLowerCase();`r`n        `$scope.canDeleteCadastros = role === 'manager' || role === 'coordinator' || role === 'coordenador';`r`n    }`r`n`r`n    updateDeletePermission();`r`n    `$scope.`$watch(function () {`r`n        return `$rootScope.currentUser;`r`n    }, updateDeletePermission, true);`r`n`r`n    `$scope.getInstrutores = function () {`r`n        MusicalizacaoService.getInstrutores().then(function (data) {`r`n            `$scope.instrutores = data;`r`n            `$scope.loading = false;`r`n        }).catch(function (error) {`r`n            console.error('Erro ao buscar instrutores:', error);`r`n            `$scope.loading = false;`r`n        });`r`n    };`r`n`r`n    `$scope.getPolos = function () {`r`n        MusicalizacaoService.getPolos().then(function (data) {`r`n            `$scope.polos = data || [];`r`n        }).catch(function (error) {`r`n            console.error('Erro ao buscar polos:', error);`r`n            `$scope.polos = [];`r`n        });`r`n    };`r`n`r`n    `$scope.exportToExcel = function () {`r`n        var grupos = getGroupedInstrutoresByMunicipio();`r`n        var rows = [`r`n            ['CONGREGAÇÃO CRISTÃ NO BRASIL'],`r`n            ['Regional Itapevi - São Paulo'],`r`n            ['MUSICALIZAÇÃO INFANTIL'],`r`n            ['Relatório de Instrutores e Colaboradores'],`r`n            ['Emissão: ' + new Date().toLocaleDateString('pt-BR')],`r`n            []`r`n        ];`r`n`r`n        grupos.forEach(function (grupo) {`r`n            rows.push(['MUNICÍPIO: ' + grupo.municipio]);`r`n            rows.push(['Nome Completo', 'Função', 'Telefone/Contato', 'Polo de Atuação', 'Status']);`r`n`r`n            grupo.instrutores.forEach(function (instrutor) {`r`n                rows.push([`r`n                    instrutor.nome_completo || '',`r`n                    instrutor.role || 'Monitor(a)',`r`n                    instrutor.celular || '-',`r`n                    getInstrutorPoloLabel(instrutor),`r`n                    instrutor.status || 'Ativo'`r`n                ]);`r`n            });`r`n`r`n            rows.push([]);`r`n        });`r`n`r$scope.exportToPDF = function () {"

if ($content.Contains($badBlock)) {
    $content = $content.Replace($badBlock, $goodBlock)
}

# 2. Fix the "};oupedInstrutoresByMunicipio();" garbage
$garbageBlock = "};oupedInstrutoresByMunicipio();"
if ($content.Contains($garbageBlock)) {
    $content = $content.Replace($garbageBlock, "};`n    function getGroupedInstrutoresByMunicipio() {")
}

# 3. Global Mojibake Repair (Most comprehensive list)
$replacements = @{
    "SANTANA DE PARNAÃƒÂ BA" = "SANTANA DE PARNAÍBA";
    "MarÃƒÂ§o" = "Março";
    "MarÃ§o" = "Março";
    "SÃƒÂ£o Paulo" = "São Paulo";
    "RelatÃƒÂ³rio" = "Relatório";
    "EmissÃƒÂ£o" = "Emissão";
    "CONGREGAÃƒâ€¡ÃƒÆ’O CRISTÃƒÆ’ NO BRASIL" = "CONGREGAÇÃO CRISTÃ NO BRASIL";
    "MUSICALIZAÃƒâ€¡ÃƒÆ’O INFANTIL" = "MUSICALIZAÇÃO INFANTIL";
    "MUNICÃƒÂ PIO" = "MUNICÍPIO";
    "FunÃƒÂ§ÃƒÂ£o" = "Função";
    "AtuaÃƒÂ§ÃƒÂ£o" = "Atuação";
    "CrianÃ§a" = "Criança"
}

foreach ($key in $replacements.Keys) {
    if ($content.Contains($key)) {
        $content = $content.Replace($key, $replacements[$key])
    }
}

# Save with UTF-8 without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($relativePath, $content, $utf8NoBom)
