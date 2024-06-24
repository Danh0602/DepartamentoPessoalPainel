#!/usr/bin/env python
# coding: utf-8

import smtplib
import email.message
from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/enviar_indicacao', methods=['POST'])
def enviar_indicacao():
    corpo_email = f"""
    <p><strong>Nome do Indicador:</strong> {request.form['nomeIndicador']}</p>
    <p><strong>Vaga Indicada:</strong> {request.form['vagaIndicada']}</p>
    <p><strong>Motivo da Indicação:</strong> {request.form['motivoIndicacao']}</p>
    """

    msg = email.message.Message()
    msg['Subject'] = "Indicação"
    msg['From'] = 'vivarareuniao@gmail.com'
    msg['To'] = request.form['emailIndicador']  # Usuário fornece o e-mail de destino
    password = 'fhmo kixn zvgu slml'  # Senha do remetente (substitua pela senha real)
    msg.add_header('Content-Type', 'text/html')
    msg.set_payload(corpo_email)

    try:
        s = smtplib.SMTP('smtp.gmail.com:587')
        s.starttls()
        # Login Credentials for sending the mail
        s.login(msg['From'], password)
        s.sendmail(msg['From'], [msg['To']], msg.as_string().encode('utf-8'))
        print('Email enviado')
        return jsonify({'status': 'success', 'message': 'Indicação enviada com sucesso!'})
    except Exception as e:
        print(f'Erro ao enviar e-mail: {e}')
        return jsonify({'status': 'error', 'message': 'Ocorreu um erro ao enviar a indicação. Por favor, tente novamente mais tarde.'}), 500
    finally:
        s.quit()

if __name__ == '__main__':
    app.run(debug=True)
