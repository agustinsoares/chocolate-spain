-- Pegá este script en el SQL Editor de Supabase (una sola vez).
-- Lectura pública; escritura solo para perfiles.rol = 'admin'.

create table if not exists public.historias_clientes (
  id serial primary key,
  nombre text not null,
  foto_url text,
  puntaje numeric(2, 1) not null default 5
    check (puntaje >= 0 and puntaje <= 5 and (puntaje * 2) = floor(puntaje * 2)),
  descripcion text not null,
  orden integer not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

alter table public.historias_clientes enable row level security;

grant select on public.historias_clientes to anon, authenticated;
grant insert, update, delete on public.historias_clientes to authenticated;
grant usage, select on sequence public.historias_clientes_id_seq to authenticated;

drop policy if exists "historias_clientes_select" on public.historias_clientes;
create policy "historias_clientes_select"
  on public.historias_clientes
  for select
  using (true);

drop policy if exists "historias_clientes_insert" on public.historias_clientes;
create policy "historias_clientes_insert"
  on public.historias_clientes
  for insert
  with check (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

drop policy if exists "historias_clientes_update" on public.historias_clientes;
create policy "historias_clientes_update"
  on public.historias_clientes
  for update
  using (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  )
  with check (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

drop policy if exists "historias_clientes_delete" on public.historias_clientes;
create policy "historias_clientes_delete"
  on public.historias_clientes
  for delete
  using (
    exists (
      select 1 from public.perfiles
      where perfiles.id = auth.uid() and perfiles.rol = 'admin'
    )
  );

insert into public.historias_clientes (nombre, foto_url, puntaje, descripcion, orden, activo)
select * from (values
  (
    'María González',
    null::text,
    5::numeric,
    'Las tartas de Chocolate son una delicia, se nota el cariño en cada detalle. El dulce de leche sabe exactamente como el de casa.',
    1,
    true
  ),
  (
    'Julián Pérez',
    null::text,
    5::numeric,
    'Pedí brownies para un cumpleaños y todos quedaron encantados. Repetiré seguro, la calidad es excelente.',
    2,
    true
  ),
  (
    'Carla Fernández',
    null::text,
    4::numeric,
    'Encontrar sabores argentinos aquí en Valencia fue una gran sorpresa. El rogel es espectacular.',
    3,
    true
  ),
  (
    'Sofía Martínez',
    null::text,
    4.5::numeric,
    'La torta Marquise es un pecado, húmeda y con la cantidad justa de dulce de leche. Llegó impecable a domicilio.',
    4,
    true
  ),
  (
    'Diego Herrera',
    null::text,
    5::numeric,
    'El apple crumble tiene el punto exacto entre la manzana con canela y el crumble crocante. Ya es un clásico en casa.',
    5,
    true
  ),
  (
    'Lucía Romero',
    null::text,
    4::numeric,
    'Pedí Havanette para agasajar a mi familia y no quedó ni un pedazo. Se nota que está hecho con dedicación.',
    6,
    true
  )
) as seed(nombre, foto_url, puntaje, descripcion, orden, activo)
where not exists (select 1 from public.historias_clientes);
