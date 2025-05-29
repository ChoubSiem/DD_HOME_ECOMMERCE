<?php

namespace App\Http\Resources;

use App\Models\Permission;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RolePermissionResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'role' => new RoleResource($this->whenLoaded('role')),
            'permissions' => $this->whenLoaded('permission', function () {
                return PermissionResource::collection($this->permission_id); 
            }),
        ];
        
    }
}
