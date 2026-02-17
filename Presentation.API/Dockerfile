# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files for caching
COPY ["Application/Application.csproj", "Application/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Presentation.API/Presentation.API.csproj", "Presentation.API/"]
COPY ["Repositories.Concretes/Repositories.Concretes.csproj", "Repositories.Concretes/"]
COPY ["Repositories.Contracts/Repositories.Contracts.csproj", "Repositories.Contracts/"]
COPY ["Services.Concretes/Services.Concretes.csproj", "Services.Concretes/"]
COPY ["Services.Contracts/Services.Contracts.csproj", "Services.Contracts/"]
COPY ["Shared/Shared.csproj", "Shared/"]

# Restore using APPLICATION project (startup project)
RUN dotnet restore "Application/Application.csproj"

# Copy full source
COPY . .

# Publish Application (the real Web API host)
WORKDIR "/src/Application"
RUN dotnet publish "Application.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false


# -------- RUNTIME STAGE --------
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app

EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

ENTRYPOINT ["dotnet", "Application.dll"]
