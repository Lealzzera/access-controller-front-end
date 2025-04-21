import style from "./style.module.css";

export default function CardInfoComponent() {
  return (
    <div className={style.cardContainer}>
      <div className={style.imageContainer}>
        <img
          src="https://images.paramount.tech/uri/mgid:arc:imageassetref:shared.southpark.br:3f26146f-dd21-415a-ab52-34fe4dff3175?quality=0.7&gen=ntrn"
          alt="Teste"
          className={style.imgContent}
        />
      </div>
      <div className={style.infoContainer}>
        <p>
          <span className={style.titleInfo}>Nome: </span>Kyle Broflovski
        </p>
        <p>
          <span className={style.titleInfo}>Período: </span>Tarde
        </p>
        <p>
          <span className={style.titleInfo}>Prof: </span>Ana Maria Silva Santos
        </p>
        <p className={style.statusContainer}>
          <span className={style.titleInfo}>Status: </span>
          <span className={style.active}></span>Ativo
        </p>
      </div>
    </div>
  );
}
