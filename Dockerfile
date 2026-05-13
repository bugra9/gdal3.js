FROM emscripten/emsdk:3.1.64

RUN apt-get update && apt-get install -y \
    automake \
    autoconf \
    libtool \
    pkg-config \
    make \
    cmake \
    git \
    curl \
    wget \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

RUN wget https://www.sqlite.org/2024/sqlite-autoconf-3450100.tar.gz \
    && tar -xzf sqlite-autoconf-3450100.tar.gz \
    && cd sqlite-autoconf-3450100 \
    && ./configure --prefix=/usr/local \
    && make -j$(nproc) \
    && make install \
    && cd .. && rm -rf sqlite-autoconf-3450100*

# FNM + Node + PNPM
RUN curl -fsSL https://fnm.vercel.app/install | bash -s -- --install-dir /usr/local/bin --skip-shell
ENV FNM_DIR="/root/.fnm"
ENV PATH="${FNM_DIR}/bin:${FNM_DIR}/multishells/containers/bin:/usr/local/bin:${PATH}"
SHELL ["/bin/bash", "-lc"]

RUN set -eux; \
    eval "$(fnm env --use-on-cd --shell=bash)"; \
    fnm install 22; \
    fnm default 22; \
    fnm use 22; \
    ln -sf $(fnm which node) /usr/local/bin/node; \
    ln -sf $(dirname $(fnm which node))/npm /usr/local/bin/npm; \
    npm install -g pnpm@latest; \
    ln -sf $(npm root -g)/pnpm/bin/pnpm.cjs /usr/local/bin/pnpm; \
    node -v && npm -v && pnpm -v && fnm --version

# Add your app
WORKDIR /app
COPY start.sh /app/start.sh
RUN chmod +x /app/start.sh

ENTRYPOINT ["/app/start.sh"]

