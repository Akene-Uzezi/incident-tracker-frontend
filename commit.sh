set -e

echo "staging changes"
git add .

read -p "enter commit message: " message
git commit -m "$message"

echo "pushing changes"
git push

clear
