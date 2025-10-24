#!/bin/bash

# Script de nettoyage final pour Jojodle
# Supprime le backup des anciens fichiers

echo "🧹 Nettoyage Final - Jojodle"
echo "============================"
echo ""

# Vérifier si le backup existe
if [ -d ".backup-old-architecture" ]; then
    echo "📦 Backup trouvé : .backup-old-architecture/"
    echo ""
    echo "Contenu du backup :"
    du -sh .backup-old-architecture/*
    echo ""
    
    read -p "⚠️  Voulez-vous supprimer le backup ? (oui/non) : " confirmation
    
    if [ "$confirmation" = "oui" ] || [ "$confirmation" = "o" ] || [ "$confirmation" = "y" ] || [ "$confirmation" = "yes" ]; then
        echo ""
        echo "🗑️  Suppression du backup..."
        rm -rf .backup-old-architecture/
        echo "✅ Backup supprimé avec succès !"
        echo ""
        echo "📊 Espace disque libéré :"
        echo "   Les anciens fichiers ont été supprimés."
    else
        echo ""
        echo "❌ Suppression annulée."
        echo "ℹ️  Le backup reste dans : .backup-old-architecture/"
    fi
else
    echo "ℹ️  Aucun backup trouvé."
    echo "   Le nettoyage a déjà été effectué ou le backup n'existe pas."
fi

echo ""
echo "✨ Nettoyage terminé !"
