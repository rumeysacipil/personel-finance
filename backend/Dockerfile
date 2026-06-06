# ---- Build stage ----
FROM maven:3.9.9-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
RUN ./mvnw -DskipTests dependency:go-offline

COPY src src
RUN ./mvnw -DskipTests clean package

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app/target/personel-finance-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD ["sh", "-c", "curl -sf http://localhost:8081/actuator/health || exit 1"]
CMD ["sh","-c","java -Dserver.port=${PORT:-8081} -jar app.jar"]
