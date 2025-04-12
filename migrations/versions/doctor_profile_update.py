"""doctor profile update

Revision ID: doctor_profile_update
Revises: [ID de la última revisión]
Create Date: [fecha actual]

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'doctor_profile_update'
down_revision = None  # Reemplazar con el ID de la última revisión
branch_labels = None
depends_on = None


def upgrade():
    # Actualizar la tabla doctors
    op.add_column('doctors', sa.Column('description', sa.Text(), nullable=True))
    op.add_column('doctors', sa.Column('education', sa.Text(), nullable=True))
    op.add_column('doctors', sa.Column('experience_years', sa.Integer(), nullable=True))
    op.add_column('doctors', sa.Column('consultation_fee', sa.Float(), nullable=True))
    op.add_column('doctors', sa.Column('available_online', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('doctors', sa.Column('languages', postgresql.ARRAY(sa.String()), nullable=True))
    op.add_column('doctors', sa.Column('office_address', sa.String(255), nullable=True))
    op.add_column('doctors', sa.Column('office_phone', sa.String(20), nullable=True))
    op.add_column('doctors', sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')))
    op.add_column('doctors', sa.Column('updated_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')))
    
    # Eliminar columnas obsoletas
    op.drop_column('doctors', 'subscription_active')
    op.drop_column('doctors', 'subscription_end')
    
    # Crear tabla doctor_credentials
    op.create_table('doctor_credentials',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(100), nullable=False),
        sa.Column('institution', sa.String(100), nullable=False),
        sa.Column('year', sa.Integer(), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('file_path', sa.String(255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Crear tabla doctor_reviews
    op.create_table('doctor_reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('doctor_id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('rating', sa.Integer(), nullable=False),
        sa.Column('comment', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True, server_default=sa.text('now()')),
        sa.ForeignKeyConstraint(['doctor_id'], ['doctors.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade():
    # Eliminar tablas
    op.drop_table('doctor_reviews')
    op.drop_table('doctor_credentials')
    
    # Restaurar columnas eliminadas
    op.add_column('doctors', sa.Column('subscription_active', sa.Boolean(), nullable=True, server_default='false'))
    op.add_column('doctors', sa.Column('subscription_end', sa.DateTime(), nullable=True))
    
    # Eliminar columnas agregadas
    op.drop_column('doctors', 'updated_at')
    op.drop_column('doctors', 'created_at')
    op.drop_column('doctors', 'office_phone')
    op.drop_column('doctors', 'office_address')
    op.drop_column('doctors', 'languages')
    op.drop_column('doctors', 'available_online')
    op.drop_column('doctors', 'consultation_fee')
    op.drop_column('doctors', 'experience_years')
    op.drop_column('doctors', 'education')
    op.drop_column('doctors', 'description') 