import { Injectable } from "@angular/core";
import { ApiService } from "./api";
@Injectable({
  providedIn: "root",
})
export class AlmacenesService {
  constructor(private apiService: ApiService) {}

    getAlmacenes() {
        return this.apiService.get("/almacenes");
    }

    getAlmacen(id: String) {
        return this.apiService.get(`/almacenes/${id}`);
    }

    crearAlmacen(data: any) {
        return this.apiService.post("/almacenes", data);
    }

    actualizarAlmacen(id: String, data: any) {
        return this.apiService.put(`/almacenes/${id}`, data);
    }

    eliminarAlmacen(id: String) {
        return this.apiService.delete(`/almacenes/${id}`);
    }
}