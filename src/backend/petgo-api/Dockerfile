# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj and restore
COPY ["petgo.api.csproj", "./"]
RUN dotnet restore "petgo.api.csproj"

# Copy everything and build
COPY . .
RUN dotnet build "petgo.api.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "petgo.api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS final
WORKDIR /app

# Instalar curl para health checks
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

COPY --from=publish /app/publish .

# Variáveis de ambiente (Railway sobrescreve via variáveis)
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

EXPOSE 8080

ENTRYPOINT ["dotnet", "petgo.api.dll"]