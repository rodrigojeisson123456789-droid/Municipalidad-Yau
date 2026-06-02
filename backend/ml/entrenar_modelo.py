import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
import joblib
import json
import os

# Generar datos de entrenamiento simulados (basados en casos reales)
np.random.seed(42)
n_samples = 5000

# Características
data = {
    'dias_espera': np.random.exponential(15, n_samples).astype(int),
    'num_quejas': np.random.poisson(2, n_samples),
    'monto': np.random.uniform(0, 50000, n_samples),
    'es_fin_mes': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
    'feriados': np.random.choice([0, 1, 2], n_samples, p=[0.6, 0.3, 0.1])
}

# Tipos de trámite
tipos = ['Licencia construcción', 'Autorización comercial', 'Atención queja', 
         'Registro proveedor', 'Certificado habilitación', 'Solicitud servicio']
data['tipo'] = np.random.choice(tipos, n_samples)

# Áreas
areas = ['Urbanismo', 'Comercio', 'Atención ciudadano', 'Logística', 'Fiscalización']
data['area'] = np.random.choice(areas, n_samples)

df = pd.DataFrame(data)

# Crear variable objetivo (crítico) con reglas más realistas
df['critico'] = 0
df.loc[df['dias_espera'] > 20, 'critico'] = 1
df.loc[df['num_quejas'] > 3, 'critico'] = 1
df.loc[df['monto'] > 30000, 'critico'] = 1
df.loc[(df['tipo'] == 'Licencia construcción') & (df['dias_espera'] > 15), 'critico'] = 1
df.loc[(df['area'] == 'Urbanismo') & (df['dias_espera'] > 18), 'critico'] = 1

print(f"📊 Datos generados: {len(df)} registros")
print(f"🎯 Trámites críticos: {df['critico'].sum()} ({df['critico'].mean()*100:.1f}%)")

# Codificar variables categóricas
le_tipo = LabelEncoder()
le_area = LabelEncoder()
df['tipo_cod'] = le_tipo.fit_transform(df['tipo'])
df['area_cod'] = le_area.fit_transform(df['area'])

# Preparar features
features = ['tipo_cod', 'area_cod', 'dias_espera', 'num_quejas', 'monto', 'es_fin_mes', 'feriados']
X = df[features]
y = df['critico']

# Entrenar modelo
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

model = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42)
model.fit(X_train, y_train)

# Evaluar
accuracy = model.score(X_test, y_test)
print(f"✅ Precisión del modelo: {accuracy*100:.2f}%")

# Guardar modelo y encoders
model_dir = os.path.dirname(os.path.abspath(__file__))
joblib.dump(model, os.path.join(model_dir, 'modelo_entrenado.pkl'))

# Guardar encoders
encoders = {
    'tipos': list(le_tipo.classes_),
    'areas': list(le_area.classes_),
    'features': features,
    'accuracy': accuracy
}

with open(os.path.join(model_dir, 'encoders.json'), 'w', encoding='utf-8') as f:
    json.dump(encoders, f, ensure_ascii=False, indent=2)

print("✅ Modelo guardado exitosamente")