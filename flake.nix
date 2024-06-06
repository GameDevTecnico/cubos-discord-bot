# Flake used for development with nix
{
  inputs = {
    nixpkgs.url = "nixpkgs/nixos-24.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = inputs:
    inputs.flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import inputs.nixpkgs { inherit system; };
      in
      {
        devShell = pkgs.mkShell {
          packages = with pkgs; [
            clang-tools
            nodejs
          ];

          shellHook = ''
            export PATH="$PWD/node_modules/.bin/:$PATH"
          '';
        };
      });
}
