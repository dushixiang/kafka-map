cd web
yarn && yarn build
rm -rf ../src/main/resources/static
mv dist ../src/main/resources/static

echo "build frontend success"

cd ../
mvn -f pom.xml clean package -Dmaven.test.skip=true

echo "build kafka-map success"