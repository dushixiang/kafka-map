cd web
yarn && yarn build | exit
mv dist ../src/main/resources/static

echo "build frontend success"

cd ../
mvn -f pom.xml clean package -Dmaven.test.skip=true | exit

echo "build kafka-map success"