<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StaffDirectory extends Model
{
    protected $table = 'staffdirectory';

    protected $primaryKey = 'StaffID';

    public $incrementing = true;

    protected $keyType = 'int';

    public $timestamps = false;

    protected $fillable = [
        'firstName',
        'lastName',
        'staffPosition',
        'email',
        'staffPhone',
        'Department',
        'buildingID',
        'roomNo',
    ];

    public function building(): BelongsTo
    {
        return $this->belongsTo(CampusBuilding::class, 'buildingID', 'buildingID');
    }

    public function getFullNameAttribute(): string
    {
        return trim(trim((string) $this->firstName).' '.trim((string) $this->lastName));
    }
}
