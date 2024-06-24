document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('menu-suspenso').addEventListener('change', function() {
        const selectedOption = this.value;
        if (selectedOption === 'ferias') {
            fetchAndDisplayData('Férias.xlsx', 'Férias');
        } else if (selectedOption === 'salario') {
            fetchAndDisplayData('Salário.xlsx', 'Salário');
        } else if (selectedOption === 'indicacao-rh') {
            displayIndicationForm();
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
        const userData = jsonData.find(item => item.RE === userRE);

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
                const dateValue = data[key];
                if (isDate(dateValue)) {
                    const date = new Date(dateValue);
                    formattedData[key] = `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()}`;
                } else {
                    formattedData[key] = dateValue;
                }
            } else if (filename === 'Férias.xlsx' && (key === 'Iníc.Plan.Fér.' || key === 'Fim Plan.Fér.')) {
                formattedData[key] = data[key] || 'Vazio';
            } else if (!isNaN(Date.parse(data[key])) && !isDate(data[key])) {
                formattedData[key] = data[key];
            } else {
                formattedData[key] = data[key];
            }
        }
    }
    return formattedData;
}

function shouldFormatDate(columnName, filename) {
    if (filename === 'Férias.xlsx') {
        return ['Iníc.Per.Aquis.', 'Fim Per.Aquis.', 'Fim Plan.Fér.', 'Iníc.Plan.Fér.'].includes(columnName);
    } else if (filename === 'Salário.xlsx') {
        return ['programação salário', 'Dia de pagamento'].includes(columnName);
    }
    return false;
}

function isDate(value) {
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

function displayIndicationForm() {
    const dadosContainer = document.getElementById('dados');
    dadosContainer.innerHTML = `
        <h3>Indicação RH</h3>
        <form id="form-indicacao">
            <label for="vaga-indicada">Vaga Indicada</label>
            <input type="text" id="vaga-indicada" name="vaga-indicada" required>

            <label for="motivo-indicacao">Motivo da Indicação</label>
            <textarea id="motivo-indicacao" name="motivo-indicacao" required></textarea>

            <label for="nome-indicador">Nome do Indicador</label>
            <input type="text" id="nome-indicador" name="nome-indicador" required>

            <label for="email-indicador">Coloque seu e-mail</label>
            <input type="email" id="email-indicador" name="email-indicador" required>

            <label for="curriculo-anexo">Anexar Currículo</label>
            <input type="file" id="curriculo-anexo" name="curriculo-anexo">

            <button type="submit">Enviar</button>
        </form>
    `;
}
