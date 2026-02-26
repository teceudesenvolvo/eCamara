#!/bin/bash
export EDITOR=cat
export GIT_EDITOR=cat
cd /Users/leonardoribeiro/Documents/Documentos\ -\ MacBook\ Air\ de\ Leonardo/BluTecnologias/Developer/eCamara

# Limpar merge pendente
git merge --abort 2>&1 || true

# Fazer fetch do remoto
git fetch origin main

# Fazer reset para o estado remoto
git reset --hard origin/main

echo "Git reset concluído com sucesso!"
