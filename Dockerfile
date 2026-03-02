FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive \
    TZ=Etc/UTC \
    LANG=en_US.UTF-8 \
    LC_ALL=en_US.UTF-8 \
    GIT_SSL_BACKEND=gnutls

# Base tools, Neovim, Node.js 24, etc.
RUN apt-get update && \
    apt-get install -y \
      sudo \
      git \
      curl \
      ca-certificates \
      build-essential \
      locales \
      ripgrep \
      fd-find \
      zsh \
      fontconfig \
      bash-completion \
      tmux \
      unzip \
      zip && \
    locale-gen en_US.UTF-8 && \
    ln -s "$(command -v fdfind)" /usr/local/bin/fd && \
    rm -rf /var/lib/apt/lists/*

# Install Oh My Zsh and autosuggestions plugin
RUN git clone https://github.com/ohmyzsh/ohmyzsh.git /root/.oh-my-zsh && \
    git clone https://github.com/zsh-users/zsh-autosuggestions.git /root/.oh-my-zsh/custom/plugins/zsh-autosuggestions

# Provide a default .zshrc to skip the newuser prompt (overridden if you mount your own)
RUN printf 'export ZSH=/root/.oh-my-zsh\nZSH_THEME="robbyrussell"\nplugins=(git zsh-autosuggestions)\nsource $ZSH/oh-my-zsh.sh\n' > /root/.zshrc

# Install FiraCode Nerd Font
RUN curl -LO https://github.com/ryanoasis/nerd-fonts/releases/download/v2.3.3/FiraCode.zip && \
    unzip FiraCode.zip -d /usr/share/fonts && \
    fc-cache -fv && \
    rm FiraCode.zip

# Install latest fzf from official releases (>=0.36)
# Use a known tag with both amd64/arm64 assets
ARG FZF_VERSION=0.55.0
RUN set -eux; \
    arch="$(dpkg --print-architecture)"; \
    case "$arch" in \
      amd64) fzf_arch='linux_amd64' ;; \
      arm64) fzf_arch='linux_arm64' ;; \
      *) echo "Unsupported arch: $arch"; exit 1 ;; \
    esac; \
    curl -fsSLo /tmp/fzf.tar.gz "https://github.com/junegunn/fzf/releases/download/v${FZF_VERSION}/fzf-${FZF_VERSION}-${fzf_arch}.tar.gz"; \
    tar -xzf /tmp/fzf.tar.gz -C /tmp; \
    install -m 0755 /tmp/fzf /usr/local/bin/fzf; \
    rm -f /tmp/fzf.tar.gz /tmp/fzf

# Bootstrap lazy.nvim plugin manager for Neovim
RUN mkdir -p /root/.local/share/nvim/lazy && \
    git clone https://github.com/folke/lazy.nvim.git /root/.local/share/nvim/lazy/lazy.nvim

# Install Neovim v0.11.5 from the official prebuilt tarball (arch-aware)
ARG NEOVIM_VERSION=v0.11.5
RUN set -eux; \
    arch="$(dpkg --print-architecture)"; \
    case "$arch" in \
      amd64) archive="nvim-linux-x86_64.tar.gz"; dir="nvim-linux-x86_64" ;; \
      arm64) archive="nvim-linux-arm64.tar.gz"; dir="nvim-linux-arm64" ;; \
      *) echo "Unsupported arch: $arch"; exit 1 ;; \
    esac; \
    curl -fsSLo /tmp/${archive} "https://github.com/neovim/neovim/releases/download/${NEOVIM_VERSION}/${archive}"; \
    tar -xzf /tmp/${archive} -C /usr/local; \
    ln -sf /usr/local/${dir}/bin/nvim /usr/local/bin/nvim; \
    rm -f /tmp/${archive}

# Install Node.js 24 via NodeSource
RUN apt-get update && \
    apt-get install -y curl ca-certificates gnupg && \
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Install Codex CLI via npm (global)
RUN npm install -g @openai/codex && \
    mkdir -p /root/.codex && \
    printf "[[defaults]]\nconfirm_exec = true\n" > /root/.codex/config.toml

WORKDIR /workspace

CMD ["bash"]
