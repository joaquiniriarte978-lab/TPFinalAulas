package com.TrabajoFinal.Aulas.model.enums;

public enum Estado {
    PENDIENTE {
        @Override
        public boolean puedePasarA(Estado destino) {
            return destino == EN_REVISION;
        }
    },
    EN_REVISION {
        @Override
        public boolean puedePasarA(Estado destino) {
            return destino == RESUELTO;
        }
    },
    RESUELTO {
        @Override
        public boolean puedePasarA(Estado destino) {
            return false;
        }
    };

    public abstract boolean puedePasarA(Estado destino);
}
