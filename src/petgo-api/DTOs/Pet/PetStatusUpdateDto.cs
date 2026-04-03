using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using petgo_api.Enums;

namespace petgo_api.DTOs.Pet
{
    public class PetStatusUpdateDto
    {
        public StatusPet NovoStatus { get; set; }
    }
}