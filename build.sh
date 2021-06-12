cd web && npm run build
mv build ../src/main/resources/static
source ~/.bash_profile
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-11.0.7.jdk/Contents/Home
cd .. && mvn clean package -Dmaven.test.skip=true
rm -rf src/main/resources/static