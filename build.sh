cd web && npm run build
mv build ../src/main/resources/static
source ~/.bash_profile
cd .. && mvn clean package -Dmaven.test.skip=true
rm -rf src/main/resources/static