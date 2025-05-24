# Zadanie 2  – Sprawozdanie

## Sposób tagowania obrazów i danych cache

- **Obrazy**:
  - `vX.Y.Z` – wersja semantyczna (push tagu Git, np. `v1.0.0`)
  - `sha-<short>` – unikalny hash commita, ułatwiający rollback
- **Cache warstw**:
  - Repozytorium cache: `docker.io/<DockerHub_USER>/pawchozad2-cache:latest`
  - Tryb `mode=max` – pełna synchronizacja warstw builda

**Uzasadnienie**:  
Tagowanie semver pozwala na czytelne zarządzanie wersjami i zgodność z release’ami, a hash commita gwarantuje unikalność i możliwość debugowania konkretnego builda. Oddzielny repozytorium cache przyspiesza kolejne buildy, zmniejsza zużycie transferu i korzysta z publicznych repozytoriów DockerHub.

---

## Test CVE

Wybrano skaner Trivy zamiast Docker Scout, ponieważ:
- jest prostszy w  integracji w GitHub Actions (gotowa akcja `aquasecurity/trivy-action`)
- szybszy w  skanowaniu obrazów Node.js i Alpine
- brak konieczności dodatkowych kont i płatnych planów

Test uruchamiany jest z poziomu workflow, z parametrem `exit-code: 1` dla podatności o poziomie HIGH lub CRITICAL, co blokuje publikację obrazu w razie ich wykrycia.

---

## Konfiguracja i wykonanie etapów

1. **Początkowa konfiguracja**:
   - skopiowane plików z rozwiązania zadania 1 oraz zainicjowanie repo `git init -b main | git repo create`
   - dodanie pliku `.github/workflows/docker-build.yml`
2. **Wymagane zmienne**:
   - `DOCKERHUB_USERNAME` skonfigurowany za pomocą polecenia: `gh variable set DOCKERHUB_USERNAME`
   - `DOCKERHUB_TOKEN` najpierw wygenerowany na stronie Docker Hub, następnie dodany do repo za pomocą polecenia: `gh secret set DOCKERHUB_TOKEN`
   - (Wbudowany) `GITHUB_TOKEN` – do logowania do GHCR  
3. **Build multi-arch** 
   - QEMU + Buildx dla `linux/amd64, linux/arm64`  
   - Cache z DockerHub (`cache-from` / `cache-to`)  
4. **Skan CVE**  
   - Trivy analiza obrazu załadowanego lokalnie  
5. **Push do GHCR**  
   - Tylko gdy skan zakończy się sukcesem (`if: success()`)  

Każdy krok zrealizowano w `.github/workflows/docker-build.yml`, a workflow został poprawnie uruchomiony przynajmniej raz, potwierdzając jego działanie.
