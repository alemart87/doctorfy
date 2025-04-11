import os
import sys
import click
from flask.cli import FlaskGroup
from app import create_app
from models import db, User
from werkzeug.security import generate_password_hash

app = create_app()
cli = FlaskGroup(create_app=create_app)

@cli.command('create-db')
def create_db():
    """Crea todas las tablas en la base de datos."""
    db.create_all()
    click.echo('Base de datos creada.')

@cli.command('drop-db')
def drop_db():
    """Elimina todas las tablas de la base de datos."""
    if click.confirm('¿Estás seguro de que quieres eliminar todas las tablas?'):
        db.drop_all()
        click.echo('Base de datos eliminada.')

@cli.command('create-admin')
@click.option('--email', prompt=True, help='Email del administrador')
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True, help='Contraseña del administrador')
def create_admin(email, password):
    """Crea un usuario administrador."""
    with app.app_context():
        user = User.query.filter_by(email=email).first()
        if user:
            click.echo(f'El usuario {email} ya existe.')
            return
        
        admin = User(
            email=email,
            password_hash=generate_password_hash(password),
            is_doctor=True,
            role='ADMIN'
        )
        db.session.add(admin)
        db.session.commit()
        click.echo(f'Administrador {email} creado con éxito.')

@cli.command('list-users')
def list_users():
    """Lista todos los usuarios en la base de datos."""
    with app.app_context():
        users = User.query.all()
        if not users:
            click.echo('No hay usuarios en la base de datos.')
            return
        
        click.echo('Lista de usuarios:')
        for user in users:
            click.echo(f'ID: {user.id}, Email: {user.email}, Doctor: {user.is_doctor}, Rol: {user.role}')

if __name__ == '__main__':
    cli() 