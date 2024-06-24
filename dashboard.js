document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-suspenso').addEventListener('change', function() {
        const selectedOption = this.value;
        if (selectedOption === 'ferias') {
            fetchAndDisplayData('Férias.xlsx', 'Férias');
        } else if (selectedOption === 'salario') {
            fetchAndDisplayData('Salário.xlsx', 'Salário');
        } else {
            document.getElementById('dados').innerHTML = '<h3>Selecione uma opção para exibir os dados</h3>';
        }
    });
});

async function fetchAndDisplayData(filename, type) {
    try {
        const response = await fetch(filename);
        if (!response.ok) {
            throw new Error('Erro ao buscar arquivo');
        }
        const data = await response.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });

        const userRE = localStorage.getItem('userRE'); // Obtém o identificador do usuário
        const userData = jsonData.find(item => item.RE.toString() === userRE);

        if (userData) {
            const formattedData = formatData(userData, filename); // Passa o nome do arquivo para diferenciar a formatação
            displayData(formattedData, type);
        } else {
            alert('Dados do usuário não encontrados!');
        }
    } catch (error) {
        console.error('Erro ao buscar dados:', error);
    }
}

function formatData(data, filename) {
    const formattedData = {};
    for (const key in data) {
        if (data.hasOwnProperty(key)) {
            if (shouldFormatDate(key, filename)) {
                // Se a coluna deve ser formatada para data
                const dateValue = data[key];
                if (isDate(dateValue)) {
                    const date = new Date(dateValue);
                    formattedData[key] = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
                } else {
                    formattedData[key] = dateValue; // Mantém o valor original se não for uma data válida
                }
            } else if (filename === 'Férias.xlsx' && (key === 'Iníc.Plan.Fér.' || key === 'Fim Plan.Fér.')) {
                // Caso específico para as colunas Iníc.Plan.Fér. e Fim Plan.Fér. em Férias.xlsx
                formattedData[key] = data[key] || 'Vazio'; // Se estiver vazio, define como 'Vazio'
            } else if (!isNaN(Date.parse(data[key])) && !isDate(data[key])) {
                // Verifica se o valor pode ser interpretado como data (mas não é uma data válida)
                formattedData[key] = data[key]; // Mantém o valor original
            } else if (key === 'Salário') {
                // Formata o campo Salário
                formattedData[key] = parseFloat(data[key]).toFixed(2);
            } else if (key === 'RE') {
                // Formata o campo RE
                formattedData[key] = data[key].padStart(6, '0');
            } else {
                // Caso contrário, mantém o valor original
                formattedData[key] = data[key];
            }
        }
    }
    return formattedData;
}

function shouldFormatDate(columnName, filename) {
    // Função para verificar se uma coluna específica de um arquivo deve ser formatada para data
    if (filename === 'Férias.xlsx') {
        // Colunas a serem formatadas em Férias.xlsx
        return ['Iníc.Per.Aquis.', 'Fim Per.Aquis.', 'Fim Plan.Fér.', 'Iníc.Plan.Fér.'].includes(columnName);
    } else if (filename === 'Salário.xlsx') {
        // Colunas a serem formatadas em Salário.xlsx
        return ['Programação salário', 'Dia de pagamento'].includes(columnName);
    } else if (filename === 'IndicaçãoRH.xlsx') {
        // Colunas a serem formatadas em IndicaçãoRH.xlsx
        return ['Data de Indicação', 'Data de Contratação'].includes(columnName);
    }
    return false;
}

function isDate(value) {
    // Função para verificar se um valor pode ser interpretado como uma data válida
    return (typeof value === 'string' && !isNaN(Date.parse(value)));
}

function displayData(data, type) {
    const dadosContainer = document.getElementById('dados');
    dadosContainer.innerHTML = `
        <h3>Dados de ${type}</h3>
        ${Object.keys(data).map(key => `<p><strong>${formatarPalavra(key)}:</strong> ${data[key]}</p>`).join('')}
    `;
}

function formatarPalavra(palavra) {
    return palavra.charAt(0).toUpperCase() + palavra.slice(1);
}
