# -------- BUILD STAGE --------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy csproj files first (for better caching)
COPY ["Application/Application.csproj", "Application/"]
COPY ["Domain/Domain.csproj", "Domain/"]
COPY ["Presentation.API/Presentation.API.csproj", "Presentation.API/"]
COPY ["Repositories.Concretes/Repositories.Concretes.csproj", "Repositories.Concretes/"]
COPY ["Repositories.Contracts/Repositories.Contracts.csproj", "Repositories.Contracts/"]
COPY ["Services.Concretes/Services.Concretes.csproj", "Services.Concretes/"]
COPY ["Services.Contracts/Services.Contracts.csproj", "Services.Contracts/"]
COPY ["Shared/Shared.csproj", "Shared/"]

# Restore ONLY API project
RUN dotnet restore "Presentation.API/Presentation.API.csproj"

# Copy full source
COPY . .

# Publish API
WORKDIR "/src/Presentation.API"
RUN dotnet publish "Presentation.API.csproj" \
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

ENTRYPOINT ["dotnet", "Presentation.API.dll"]
