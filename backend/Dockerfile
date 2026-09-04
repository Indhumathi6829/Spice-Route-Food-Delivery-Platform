# ─────────────────────────────────────────────
# Build stage
# ─────────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder

WORKDIR /app

# Copy pom first — download all dependencies
COPY pom.xml .
COPY src ./src

# Build in one step — Maven downloads what it needs, compiles, packages
RUN mvn -B package -Dmaven.test.skip=true

# ─────────────────────────────────────────────
# Runtime stage
# ─────────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S spring && adduser -S spring -G spring

USER spring:spring

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]