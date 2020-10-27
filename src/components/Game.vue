<template>
  <div class="game">
    <button @click="undo">Undo</button>
    <div class="flex">
      <div class="draw-piles flex mr-auto">
        <div class="draw-pile pile">
          <div
            v-if="deck.length == 0"
            class="card empty-pile"
            @click="redeal"
          ></div>
          <div v-else class="card facedown" v-on:click="draw"></div>
        </div>

        <div class="waste pile">
          <Card
            v-if="topWaste"
            :key="topWaste.rank + '-' + topWaste.suit"
            :rank="topWaste.rank"
            :suit="topWaste.suit"
            :faceup="true"
            :selected="
              selectedCard &&
                topWaste.rank === selectedCard.rank &&
                topWaste.suit === selectedCard.suit
            "
            location="WASTE"
            @select-card="selectWasteCard"
          />
          <div v-else class="card empty-pile"></div>
        </div>
      </div>

      <div class="foundation-piles flex">
        <Pile
          v-for="(pile, idx) in foundations"
          :key="'foundation-' + idx"
          :cards="pile"
          :pileIndex="idx"
          location="FOUNDATION"
          :selectedCard="selectedCard"
          @select-card="selectFoundation"
          @select-empty="selectFoundation"
        />
      </div>
    </div>

    <div class="tableau-piles flex">
      <Pile
        v-for="(pile, idx) in tableau"
        :key="'tableau-' + idx"
        :cards="pile"
        :fanned="true"
        :pileIndex="idx"
        location="TABLEAU"
        :selectedCard="selectedCard"
        @select-card="selectTableauCard"
        @select-empty="selectTableauEmpty"
      />
    </div>
  </div>
</template>

<script>
// eslint-disable-next-line no-unused-vars
import { Suits, Ranks, RankValues, Locations } from "../constants/constants.js";
import Pile from "./Pile.vue";
import Card from "./Card.vue";
import { shuffleArray } from "../utils/utils.js";

export default {
  name: "Game",
  components: {
    Pile,
    Card,
  },
  data() {
    return {
      deck: [], // list of cards to draw from
      waste: [], // list of cards discarded
      foundations: [], // list of piles
      tableau: [], // list of piles
      selectedCard: null, // card picked up by player
    };
  },
  computed: {
    topWaste() {
      return this.waste[this.waste.length - 1];
    },
  },
  methods: {
    getSuitColor(suit) {
      if (suit == "SPADES" || suit == "CLUBS") {
        return "BLACK";
      } else {
        return "RED";
      }
    },
    getRankDifference(cardA, cardB) {
      // cardA - cardB; ie., Jack - 10 = 1
      let aVal = RankValues[cardA.rank];
      let bVal = RankValues[cardB.rank];
      return aVal - bVal;
    },
    isSameCard(cardA, cardB) {
      return cardA.suit === cardB.suit && cardA.rank === cardB.rank;
    },
    isTableauPositionValid(from, to) {
      // can move a King onto an empty pile
      let toPile = this.tableau[to.pileIndex];
      console.log("moving onto tableau pile of length", toPile.length);
      if (toPile.length === 0) {
        console.log("from rank:", from.rank);
        if (from.rank === "K") {
          console.log("valid");
          return true;
        } else {
          console.log("not valid");
          return false;
        }
      }

      // can move a card onto another pile that has
      // opposite color and one rank higher
      let suitValid = false;
      let rankValid = false;
      if (this.getSuitColor(from.suit) !== this.getSuitColor(to.suit)) {
        suitValid = true;
        console.log("suit is valid");
      }
      if (this.getRankDifference(to, from) == 1) {
        rankValid = true;
        console.log("rank is valid");
      }
      return suitValid && rankValid;
    },
    isFoundationPositionValid(card) {
      // valid to play a card on foundation if...
      // - pile is empty and card is an ace
      // - pile is same suit as selected card and pile rank is 1 lower than selected card
      let pileIndex = card.pileIndex;
      console.log(this.foundations[pileIndex].length);
      if (this.foundations[pileIndex].length === 0) {
        if (this.selectedCard.rank === "A") return true;
      } else {
        let topFoundation = this.foundations[pileIndex][
          this.foundations[pileIndex].length - 1
        ];
        if (
          topFoundation.suit === this.selectedCard.suit &&
          this.getRankDifference(topFoundation, this.selectedCard) === -1
        ) {
          return true;
        }
      }
      return false;
    },
    playCardToTableau(from, to) {
      console.log(
        "Playing" + from.rank + " of " + from.suit + " from",
        from.location,
        "to",
        to.location
      );
      if (!this.isTableauPositionValid(from, to)) {
        this.selectedCard = to;
        return;
      }
      if (from.location === "WASTE") {
        const newColumn = this.tableau[to.pileIndex].slice(0);
        newColumn.push(this.waste.pop());
        this.$set(this.tableau, to.pileIndex, newColumn);
        // this.$set(this.tableau[to.pileIndex], this.tableau[to.pileIndex].length - 1, this.waste.pop());
        // this.tableau[to.pileIndex].push(this.waste.pop());
      } else if (from.location === "FOUNDATION") {
        this.tableau[to.pileIndex].push(this.foundations[from.pileIndex].pop());
      } else if (from.location === "TABLEAU") {
        let fromPile = this.tableau[from.pileIndex];
        let toPile = this.tableau[to.pileIndex];
        let fromIndex = fromPile.findIndex((c) => this.isSameCard(c, from));
        if (fromIndex === fromPile.length - 1) {
          // we are playing the top card
          toPile.push(fromPile.pop());
        } else {
          // we're moving a pile of cards
          let stack = fromPile.slice(fromIndex);
          toPile = toPile.concat(stack);
          fromPile = fromPile.slice(0, fromIndex);
          // reassign arrays because slice creates a copy
          this.tableau[from.pileIndex] = fromPile;
          this.tableau[to.pileIndex] = toPile;
        }
        // flip last card up
        let lastCard = fromPile[fromPile.length - 1];
        if (lastCard) lastCard.faceup = true;
      }
      this.selectedCard = null;
    },
    selectTableauCard(card) {
      console.log("Selecting tableau card: ", card);
      if (this.selectedCard == card) {
        this.selectedCard = null;
      } else if (this.selectedCard) {
        this.playCardToTableau(this.selectedCard, card);
      } else {
        this.selectedCard = card;
      }
    },
    selectTableauEmpty(card) {
      console.log("Selecting empty tableau");
      if (!this.selectedCard) return;
      this.playCardToTableau(this.selectedCard, card);
    },
    selectWasteCard(card) {
      if (this.selectedCard == card) {
        this.selectedCard = null;
      } else {
        this.selectedCard = card;
      }
    },
    selectFoundation(card) {
      let pileIndex = card.pileIndex;

      // pick up foundation card
      if (!this.selectedCard) {
        this.selectedCard = card;
        return;
      }

      // deselect card if selected twice
      if (this.selectedCard == card) {
        this.selectedCard = null;
        return;
      }

      // put the selected card on this foundation pile if it's a valid move
      if (this.isFoundationPositionValid(card)) {
        if (this.selectedCard.location === "TABLEAU") {
          this.foundations[pileIndex].push(
            this.tableau[this.selectedCard.pileIndex].pop()
          );
          let lastInPile = this.tableau[this.selectedCard.pileIndex][
            this.tableau[this.selectedCard.pileIndex].length - 1
          ];
          if (lastInPile) lastInPile.faceup = true;
          this.selectedCard = null;
        } else if (this.selectedCard.location === "WASTE") {
          this.foundations[pileIndex].push(this.waste.pop());
          this.selectedCard = null;
        }
      }
    },
    draw() {
      // draw from deck into waste
      let card = this.deck.pop();
      if (card) {
        card.faceup = true;
        this.waste.push(card);
      } else {
        this.redeal();
      }
      this.selectedCard = null;
    },
    redeal() {
      if (this.deck.length === 0 && this.waste.length === 0) {
        // no cards left
        return;
      }
      // flip waste over into draw pile
      this.waste.forEach((card) => {
        card.faceup = false;
      });
      this.waste.reverse();
      this.deck = this.waste;
      this.waste = [];
      this.draw();
    },
    undo() {
      if (this.topWaste) {
        let top = this.waste.pop();
        top.faceup = false;
        this.deck.push(top);
      }
    },
    initDeck() {
      // build & shuffle deck of ranks+suits
      this.deck = [];
      Object.keys(Suits).forEach((suit) => {
        Ranks.forEach((rank) => {
          const card = {
            rank,
            suit,
            faceup: true,
          };
          this.deck.push(card);
        });
      });
      shuffleArray(this.deck);
    },
    initFoundation() {
      // empty array for each suit
      this.foundations = [[], [], [], []];
    },
    initTableau() {
      // deal the tableau piles from the deck
      this.tableau = [];
      for (let i = 0; i < 7; i++) {
        let col = [];
        for (let n = 0; n < i + 1; n++) {
          let card = this.deck.pop();
          // if last card in column, turn faceup
          card.faceup = n == i ? true : false;
          col.push(card);
        }
        this.tableau.push(col);
      }
    },
  },
  created: function() {
    this.initDeck();
    this.initFoundation();
    this.initTableau();
  },
};
</script>

<style lang="scss">
body {
  padding: 0;
  margin: 0;
}

.game {
  background: #477148;
  color: white;
  padding: 100px;
  min-height: 100vh;
}
</style>
